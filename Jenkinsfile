pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1' // Standard for India (Mumbai)
        ECR_REGISTRY = '3997-0782-6475.dkr.ecr.ap-south-1.amazonaws.com'
        FRONTEND_REPO = 'nexverify-frontend'
        BACKEND_REPO = 'nexverify-backend'
        IMAGE_TAG = "build-${env.BUILD_NUMBER}"
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
                    // Requires "AWS Credentials" plugin in Jenkins
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-credentials', 
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Backend Image...'
                    sh "docker build -t ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} ./backend"
                    sh "docker build -t ${ECR_REGISTRY}/${BACKEND_REPO}:latest ./backend"

                    echo 'Building Frontend Image...'
                    sh "docker build -t ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} ./frontend"
                    sh "docker build -t ${ECR_REGISTRY}/${FRONTEND_REPO}:latest ./frontend"
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    echo 'Pushing Backend Image...'
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_REPO}:latest"

                    echo 'Pushing Frontend Image...'
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:latest"
                }
            }
        }

        stage('Cleanup Workspace') {
            steps {
                script {
                    // Clean up local dangling images to free up Jenkins disk space
                    sh "docker rmi ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} || true"
                    sh "docker rmi ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} || true"
                }
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully! Images have been pushed to AWS ECR.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
