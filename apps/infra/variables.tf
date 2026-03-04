variable "region" {
    description = "AWS region"
    type        = string
    default     = "us-east-1"
}

variable "project_name" {
    description ="scrutis"
    type=string
    default="scrutis"
}
variable "vpc_cidr"{
    description = "CIDR VPC"
    type = string
    default="10.0.0.0/16"
}
variable "subnet1_cidr"{
    description="cidr subnet 1"
    type =string
    default="10.0.1.0/24"
}
variable "subnet2_cidr"{
    description="cidr subnet 2"
    type =string
    default="10.0.2.0/24"
}
variable "db_name"{
    description="Database name"
    type =string 
    default="scrutisdb"
    }
variable "db_username"{
    description="Database username"
    type=string
    default="scrutisuser"

}
variable "instance_class"{
    description="RDS instance class"
    type=string
    default="db.t3.micro"
}
variable "db_password"{
    description ="Database password"
    type = string 
    sensitive= true
}
variable "k8s_cidr" {
  description = "CIDR cluster Kubernetes on-premise"
  type        = string
}