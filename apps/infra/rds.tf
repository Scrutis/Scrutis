resource "aws_db_subnet_group" "db_subnet_group"{
    name = "${var.project_name}-db-subnet-group"
    subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
}
resource "aws_db_instance" "postgres" {
    allocated_storage = 20
    db_name = var.db_name
    engine = "postgres"
    engine_version = "15"
    instance_class = var.instance_class
    username = var.db_username
    password = var.db_password 
    db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
    vpc_security_group_ids = [ aws_security_group.sg-scrutis.id]
    parameter_group_name = "default.postgres15"
    skip_final_snapshot = true
}