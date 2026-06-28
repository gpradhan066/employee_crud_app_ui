pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "Source code already checked out by Jenkins."
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                rm -rf ~/deploy/frontend/*
                cp -r dist/* ~/deploy/frontend/
                '''
            }
        }
    }

    post {
        success {
            echo 'Frontend deployed successfully.'
        }
    }
}
