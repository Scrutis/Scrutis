resource "aws_vpc" "main"{
    cidr_block =var.vpc_cidr
    tags={
        Name = "${var.project_name}-vpc"
    }
}
resource "aws_subnet" "subnet1"{
    vpc_id =aws_vpc.main.id
    cidr_block=var.subnet1_cidr
    availability_zone = "us-east-1a"
     tags={
        Name="${var.project_name}-subnet1"
     }
}
resource "aws_subnet" "subnet2"{
    vpc_id =aws_vpc.main.id
    cidr_block=var.subnet2_cidr
    availability_zone = "us-east-1b"
     tags={
        Name="${var.project_name}-subnet2"
     }
}
resource "aws_route_table" "main"{
    vpc_id =aws_vpc.main.id
    tags= {
        Name = "${var.project_name}-rt"
    }
    
}
resource "aws_route_table_association" "subnet1" {
  subnet_id      = aws_subnet.subnet1.id
  route_table_id = aws_route_table.main.id
}
resource "aws_route_table_association" "subnet2" {
  subnet_id      = aws_subnet.subnet2.id
  route_table_id = aws_route_table.main.id
}