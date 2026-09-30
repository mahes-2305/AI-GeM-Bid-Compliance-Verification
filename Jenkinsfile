pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        FRONTEND_REPO = 'nexverify-frontend'
        BACKEND_REPO = 'nexverify-backend'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('AWS ECR Login') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'aws-credentials',
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                        )
                    ]) {
                        env.AWS_ACCOUNT_ID = sh(
                            script: 'aws sts get-caller-identity --query Account --output text',
                            returnStdout: true
                        ).trim()

                        env.ECR_REGISTRY =
                            "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"

                        sh '''
                            set -e

                            echo "AWS Account: $AWS_ACCOUNT_ID"
                            echo "ECR Registry: $ECR_REGISTRY"

                            aws ecr get-login-password --region "$AWS_REGION" |
                                docker login \
                                --username AWS \
                                --password-stdin "$ECR_REGISTRY"
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Backend Image...'

                    sh """
                        docker build \
                        -t ${env.ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} \
                        -t ${env.ECR_REGISTRY}/${BACKEND_REPO}:latest \
                        ./backend
                    """

                    echo 'Building Frontend Image...'

                    sh """
                        docker build \
                        -t ${env.ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} \
                        -t ${env.ECR_REGISTRY}/${FRONTEND_REPO}:latest \
                        ./frontend
                    """
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'aws-credentials',
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                        )
                    ]) {
                        sh """
                            docker push ${env.ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}
                            docker push ${env.ECR_REGISTRY}/${BACKEND_REPO}:latest

                            docker push ${env.ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}
                            docker push ${env.ECR_REGISTRY}/${FRONTEND_REPO}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to EC2') {
    steps {
        script {
            withCredentials([
                sshUserPrivateKey(
                    credentialsId: 'nexverify-ec2-ssh',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )
            ]) {

                sh '''
                    set -e

                    echo "Copying production compose file to EC2..."

                    scp \
                      -i "$SSH_KEY" \
                      -o StrictHostKeyChecking=no \
                      -o UserKnownHostsFile=/dev/null \
                      docker-compose.prod.yml \
                      "$SSH_USER@3.110.155.27:/opt/nexverify/docker-compose.prod.yml"

                    echo "Deploying NexVerify on EC2..."

                    ssh \
                      -i "$SSH_KEY" \
                      -o StrictHostKeyChecking=no \
                      -o UserKnownHostsFile=/dev/null \
                      "$SSH_USER@3.110.155.27" \
                      "cd /opt/nexverify && \
                       echo 'ECR_REGISTRY=399707826475.dkr.ecr.ap-south-1.amazonaws.com' > .env && \
                       aws ecr get-login-password --region ap-south-1 | \
                       docker login --username AWS --password-stdin \
                       399707826475.dkr.ecr.ap-south-1.amazonaws.com && \
                       docker compose -f docker-compose.prod.yml pull && \
                       docker compose -f docker-compose.prod.yml up -d"

                    echo "NexVerify deployment completed."
                '''
            }
        }
    }
}

        stage('Cleanup Workspace Images') {
            steps {
                sh """
                    docker rmi ${env.ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} || true
                    docker rmi ${env.ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} || true
                """
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully!'
            echo 'Docker images have been pushed to AWS ECR.'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}