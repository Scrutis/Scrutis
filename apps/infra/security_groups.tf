resource "aws_security_group" "sg-scrutis"{
    name ="${var.project_name}-sg"
    description = "Security group for Scrutis project"
    vpc_id = aws_vpc.main.id
    ingress {
        from_port = 5432
        to_port = 5432
        protocol = "tcp"
        cidr_blocks = [var.k8s_cidr]
        }
    egress{
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

}