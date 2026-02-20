pipeline {
    agent any
    tools {
        nodejs 'nodejs' 
    }
    stages {
        stage('Analisis de Backend') {
            steps {
                dir("Proyecto-CARBID/PROYECTO CARBID/backend") {
                    withSonarQubeEnv('sonarqube') {
                        bat 'npx sonar-scanner -Dsonar.ws.timeout=60 -Dsonar.host.url=http://127.0.0.1:9000'
                    }
                }
            }
        }
        stage("Quality Gate") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}




