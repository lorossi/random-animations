"""This script publishes the website to the server."""

import argparse
import asyncio
import hashlib
import logging
import os
import shlex
from glob import glob
from sys import exit

import asyncssh
import asyncssh.sftp


class WebsitePublisher:
    """Class to publish the website."""

    _source: str
    _destination: str
    _workers: int

    _semaphore: asyncio.Semaphore
    _client: asyncssh.SSHClientConnection
    _sftp: asyncssh.SFTPClient

    def __init__(self, source: str, destination: str, workers: int = 10) -> None:
        """Initialize the WebsitePublisher."""
        self._source = source
        self._destination = destination
        self._workers = workers

        self._semaphore = asyncio.Semaphore(workers)

    async def connect(self, host: str, user: str, key: str, password: str) -> None:
        """Connect to the SSH server."""
        logging.info(f"Connecting to %s as %s", host, user)

        try:
            pkey = asyncssh.import_private_key(
                key,
                passphrase=password,
            )
        except Exception as e:
            logging.error(f"Failed to load SSH key: {e}")
            exit(1)
        logging.info("SSH key loaded successfully")

        try:
            self._client = await asyncssh.connect(
                host=host,
                username=user,
                client_keys=[pkey],
                known_hosts=None,
            )
        except Exception as e:
            logging.error(f"Failed to connect to {host}: {e}")
            exit(2)
        logging.info("Connected to SSH server successfully")

        try:
            self._sftp = await self._client.start_sftp_client()
        except Exception as e:
            logging.error(f"Failed to open SFTP session: {e}")
            self._client.close()
            exit(3)
        logging.info("SFTP session opened successfully")

    async def publish(self) -> None:
        """Publish the website to the server."""
        logging.info("Starting website publication to %s", self._destination)

        await self._ensure_remote_dir(self._destination)

        async def publish_task(local_path: str, remote_path: str) -> None:
            async with self._semaphore:
                if os.path.isdir(local_path):
                    await self._ensure_remote_dir(remote_path)
                else:
                    await self._ensure_remote_dir(os.path.dirname(remote_path))
                    await self._upload_file(local_path, remote_path)

        # Walk through the source directory and upload files
        tasks = []
        for local_path in glob(f"{self._source}/**", recursive=True):
            rel_path = os.path.relpath(local_path, self._source)
            if rel_path == ".":
                continue

            remote_path = os.path.join(self._destination, rel_path)
            tasks.append(publish_task(local_path, remote_path))

        await asyncio.gather(*tasks)

    async def cleanup_remote(self) -> None:
        """Remove remote files that are not in the local source."""
        if not await self._remote_exists(self._destination):
            logging.info(
                "Remote destination %s does not exist, skipping cleanup",
                self._destination,
            )
            return

        logging.info("Starting cleanup of remote files not present in local source")

        async def cleanup_task(remote_path: str) -> None:
            async with self._semaphore:
                try:
                    await self._sftp.remove(remote_path)
                    logging.info("Removed remote file %s", remote_path)
                except Exception as e:
                    logging.error(f"Failed to remove remote file {remote_path}: {e}")

        tasks = []
        for remote_path in await self._list_remote_files(self._destination):
            local_path = os.path.join(
                self._source, os.path.relpath(remote_path, self._destination)
            )
            if os.path.exists(local_path):
                continue
            tasks.append(cleanup_task(remote_path))
        await asyncio.gather(*tasks)

    async def _list_remote_files(self, remote_path: str) -> list[str]:
        """List all files in the remote directory."""
        find_cmd = f"find {shlex.quote(remote_path)} -type f"
        try:
            result = await self._client.run(find_cmd, check=False)
        except Exception as e:
            logging.error(f"Failed to list remote directory {remote_path}: {e}")
            return []

        if result.exit_status != 0:
            stderr = result.stderr.strip() if result.stderr else ""
            logging.error("Failed to list remote directory %s: %s", remote_path, stderr)
            return []

        if result.stdout is None:
            logging.error("No output from remote directory listing for %s", remote_path)
            return []

        return [str(line) for line in result.stdout.splitlines() if line is not None]

    async def _create_folder(self, remote_path: str) -> None:
        """Create a folder on the remote server."""
        if await self._remote_exists(remote_path):
            return

        try:
            await self._sftp.mkdir(remote_path)
        except (
            asyncssh.sftp.SFTPFailure,
            IOError,
        ) as e:
            logging.error("Failed to create remote folder %s: %s", remote_path, e)
            raise

    async def _remote_exists(self, remote_path: str) -> bool:
        """Check whether a remote path exists."""
        try:
            await self._sftp.stat(remote_path)
            return True
        except asyncssh.sftp.SFTPNoSuchFile:
            return False

    async def _ensure_remote_dir(self, remote_path: str) -> None:
        """Create a remote directory and all missing parents."""
        if not remote_path:
            return

        normalized = os.path.normpath(remote_path)
        if normalized in (".", "/"):
            return

        parent = os.path.dirname(normalized)
        if parent and parent not in (".", normalized):
            await self._ensure_remote_dir(parent)

        if not await self._remote_exists(normalized):
            await self._create_folder(normalized)

    async def _upload_file(self, local_path: str, remote_path: str) -> None:
        local_hash = self._hash_local_file(local_path)
        remote_hash = await self._hash_remote_file(remote_path)

        if remote_hash is not None and local_hash == remote_hash:
            logging.info("File %s is up to date, skipping upload.", remote_path)
            return

        try:
            await self._sftp.put(local_path, remote_path)
            logging.info("Uploaded %s to %s", local_path, remote_path)
        except Exception as e:
            logging.error(f"Failed to upload {local_path} to {remote_path}: {e}")

    async def _hash_remote_file(self, remote_path: str) -> str | None:
        """Get the SHA256 hash of a remote file."""
        hash_cmd = f"sha256sum {shlex.quote(remote_path)}"
        try:
            result = await self._client.run(hash_cmd, check=False)
        except Exception:
            return None

        if result.exit_status != 0 or result.stdout is None:
            return None

        output = result.stdout.strip()
        if not output:
            return None
        return str(output.split()[0])

    def _hash_local_file(self, local_path: str) -> str:
        """Get the SHA256 hash of a local file."""
        with open(local_path, "rb") as f:
            file_data = f.read()
            return hashlib.sha256(file_data).hexdigest()

    async def disconnect(self) -> None:
        """Disconnect from the SSH server."""
        if self._sftp:
            self._sftp.exit()
            logging.info("SFTP session closed")
        if self._client:
            self._client.close()
            await self._client.wait_closed()
            logging.info("SSH client closed")


def gather_args() -> argparse.Namespace:
    """Script entry point."""
    parser = argparse.ArgumentParser(
        description="Create the website in the dist/ folder.",
    )
    parser.add_argument(
        "--host",
        type=str,
        help="SSH host for deployment",
    )
    parser.add_argument(
        "--user",
        type=str,
        help="SSH username for deployment",
    )
    parser.add_argument(
        "--source",
        type=str,
        help="Source folder for the website",
    )
    parser.add_argument(
        "--destination",
        type=str,
        help="Destination for the website (e.g. /path/to/website)",
    )
    parser.add_argument(
        "--ssh-key",
        type=str,
        help="SSH private key",
    )
    parser.add_argument(
        "--ssh-pwd",
        type=str,
        help="Password of the ssh key",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=8,
        help="Number of concurrent workers for uploading files",
    )

    return parser.parse_args()


async def main() -> None:
    """Script entry point."""
    logging.basicConfig(level=logging.INFO)
    args = gather_args()
    publisher = WebsitePublisher(
        source=args.source,
        destination=args.destination,
        workers=args.workers,
    )
    await publisher.connect(
        host=args.host,
        user=args.user,
        key=args.ssh_key,
        password=args.ssh_pwd,
    )
    await publisher.publish()
    await publisher.cleanup_remote()
    await publisher.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
