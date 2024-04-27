import asyncio
import io
import os
from typing import Dict, List, Optional

import aiohttp
from boto3 import client as boto3_client
from loguru import logger
from pydantic import BaseModel

REGION = "us-east-1"


class PresignedPost(BaseModel):
    url: str
    fields: Dict[str, str]


class SimpleStorageService:
    def __init__(self, bucket: Optional[str]) -> None:
        if not bucket:
            raise ValueError("Bucket name must be provided")

        self.bucket = bucket
        self._client = boto3_client("s3", region_name=REGION)

    async def acreate_presigned_upload_url(
        self,
        object_name: str,
    ) -> PresignedPost:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://{self.bucket}.s3.{REGION}.amazonaws.com",
                data={
                    "acl": "public-read",
                    "ContentType": "",
                    "key": object_name,
                },
            ) as resp:
                if resp.status != 200:
                    raise Exception(f"Failed to create presigned URL: {resp.status}")
                data = await resp.json()
                return PresignedPost(url=data["url"], fields=data["fields"])

    def create_presigned_download_url(self, object_name: str) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": object_name},
        )

    def upload_to_bucket(
        self,
        object_name: str,
        file: io.BytesIO,
    ) -> None:
        try:
            self._client.put_object(
                Bucket=self._bucket, Key=object_name, Body=file.getvalue()
            )
        except ClientError as e:
            logger.error(e)
            raise e

    def download_file(self, object_name: str, local_filename: str) -> None:
        self._client.download_file(
            Bucket=self._bucket, Key=object_name, Filename=local_filename
        )

    def list_keys(self, prefix: str) -> List[str]:
        files = self._client.list_objects_v2(Bucket=self._bucket, Prefix=prefix)
        if "Contents" not in files:
            return []

        return [file["Key"] for file in files["Contents"]]

    def download_folder(self, prefix: str, path: str) -> List[str]:
        local_files = []
        for key in self.list_keys(prefix):
            local_filename = os.path.join(path, key.split("/")[-1])
            self.download_file(key, local_filename)
            local_files.append(local_filename)

        return local_files

    async def adelete_folder(self, prefix: str) -> None:
        async def delete_keys(keys: List[str]) -> None:
            if not keys:
                return
            await self._client.delete_objects(
                Bucket=self._bucket,
                Delete={"Objects": [{"Key": key} for key in keys]},
            )

        keys = self.list_keys(prefix)
        for i in range(0, len(keys), 1000):
            await delete_keys(keys[i:i + 1000])


