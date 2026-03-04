resource "aws_sqs_queue" "scrutis_queue_deadletter"{
    name ="${var.project_name}-queue-deadletter"
    tags ={
        Name ="${var.project_name}-queue-deadletter"
    }
}
resource "aws_sqs_queue" "scrutis_queue"{
    name ="${var.project_name}-queue"
    delay_seconds =0
    max_message_size =262144
    message_retention_seconds =86400
    receive_wait_time_seconds =10
    redrive_policy = jsonencode ({
        deadLetterTargetArn =aws_sqs_queue.scrutis_queue_deadletter.arn
        maxReceiveCount = 3
    })
    tags = {
        Name = "${var.project_name}-queue"
    }
}