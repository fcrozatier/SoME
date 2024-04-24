import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_KEY, S3_REGION, S3_SECRET } from '$env/static/private';
import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';
import sharp from 'sharp';

const client = new S3Client({
	region: S3_REGION,
	credentials: {
		accessKeyId: S3_KEY,
		secretAccessKey: S3_SECRET
	},
	endpoint: PUBLIC_S3_ENDPOINT
});

/**
 * Saves an image File object to s3 bucket.
 * Processes the image beforehand: resizes to 16:9 (640x360px) and formats to webp
 *
 * @param thumbnail File object to save
 * @param key The name of the file on the bucket
 */
export async function saveThumbnail(thumbnail: File, key: string) {
	const input = await thumbnail.arrayBuffer();
	const output = await sharp(input)
		.resize({
			width: 640,
			height: 360
		})
		.toFormat('webp')
		.toBuffer();

	const command = new PutObjectCommand({
		Bucket: PUBLIC_S3_BUCKET,
		Key: key,
		Body: output,
		ACL: 'public-read'
	});

	await client.send(command);
}

/**
 * Deletes a thumbnail on the s3 bucket.
 *
 * @param key The name of the file on the bucket
 */
export async function deleteThumbnail(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: PUBLIC_S3_BUCKET,
		Key: key
	});

	await client.send(command);
}
