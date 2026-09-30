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