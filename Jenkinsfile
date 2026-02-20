pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    bat 'npx sonar-scanner'
                }
            }
        }

        stage('Resultado') {
            steps {
                echo "Análisis enviado correctamente a SonarQube."
                echo "Revisar en: http://localhost:9000/dashboard?id=Proyecto-CARBID-Backend"
            }
        }
    }
}










