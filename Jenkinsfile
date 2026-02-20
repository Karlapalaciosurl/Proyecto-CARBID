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
                        bat 'npx sonar-scanner -Dsonar.projectKey=PROYECTO-CARBID -Dsonar.sources=. -Dsonar.ws.timeout=120'
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






