pipeline {
    agent any
    triggers {
        githubPush()
    }
    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pruebas Backend') {
            steps {
                dir('PROYECTO CARBID/backend') {
                    bat 'npm install'
                    // Auditoría de seguridad para librerías de servidor
                    bat 'npm audit --audit-level=high'
                }
            }
        }

        stage('Pruebas de Frontend') {
            steps {
                dir('PROYECTO CARBID/frontend') {
                    bat 'npm install'
                    // Auditoría de seguridad para dependencias de React
                    bat 'npm audit --audit-level=high'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    // Se ejecuta desde la raíz para leer el sonar-project.properties
                    // El wait=true asegura que Jenkins espere el veredicto real
                    bat 'npx sonar-scanner -Dsonar.qualitygate.wait=true'
                }
            }
        }
    }

post {
    always {
        office365ConnectorSend(
            webhookUrl: "TU_WEBHOOK",
            status: currentBuild.currentResult,
            color: currentBuild.currentResult == 'SUCCESS' ? "00FF00" : "FF0000",
            message: "Resultado del pipeline: ${currentBuild.currentResult}"
        )
    }
}
}





