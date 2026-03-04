resource "aws_s3_bucket" "scrutis_bucket" {
    bucket = "${var.project_name}-bucket"
    tags = {
        Name = "${var.project_name}-bucket"
    }
}
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.us-east-1.s3"
  route_table_ids = [aws_route_table.main.id]
  tags = {
    Name = "${var.project_name}-s3-endpoint"
  }
}