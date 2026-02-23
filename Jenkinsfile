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
            webhookUrl: "https://default0f78549d3eec43afb56a6f7b042d6c.9a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4868894c1a1648dca3ca5c60ab120938/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l8mp1VPAEbGhLl6KmMFjgB7-6gZpOfxVzMLveJlznJc",
            status: currentBuild.currentResult,
            color: currentBuild.currentResult == 'SUCCESS' ? "00FF00" : "FF0000",
            message: "Resultado del pipeline: ${currentBuild.currentResult}"
        )
    }
}
}






