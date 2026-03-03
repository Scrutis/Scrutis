output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "rds_endpoint" {
  description = "Endpoint RDS PostgreSQL"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "Nom du bucket S3"
  value       = aws_s3_bucket.scrutis_bucket.bucket
}

output "sqs_queue_url" {
  description = "URL de la queue SQS"
  value       = aws_sqs_queue.scrutis_queue.url
}