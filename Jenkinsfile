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
        success {
            office365ConnectorSend status: "¡ÉXITO! - Build #${env.BUILD_NUMBER}", 
            webhookUrl: "https://default0f78549d3eec43afb56a6f7b042d6c.9a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4868894c1a1648dca3ca5c60ab120938/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l8mp1VPAEbGhLl6KmMFjgB7-6gZpOfxVzMLveJlznJc",
            color: "00FF00",
            message: "La auditoría y SonarQube pasaron correctamente."
        }
        failure {
            // Notificación automática si falla seguridad o calidad
            office365ConnectorSend status: "¡FALLÓ! - Build #${env.BUILD_NUMBER}", 
            webhookUrl: "https://default0f78549d3eec43afb56a6f7b042d6c.9a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4868894c1a1648dca3ca5c60ab120938/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l8mp1VPAEbGhLl6KmMFjgB7-6gZpOfxVzMLveJlznJc",
            color: "FF0000",
            message: "El build falló. Revisa los logs de npm audit o SonarQube."
        }
    }
}




