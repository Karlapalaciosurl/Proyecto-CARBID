pipeline {
    agent any
    stages {
        stage('Análisis de Backend') {
            steps {
                dir("Proyecto-CARBID / PROYECTO CARBID / backend") { 
                    withSonarQubeEnv('sonar2') { 
                        sh 'npx sonar-scanner' 
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
