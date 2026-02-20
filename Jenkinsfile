pipeline {
    agent any
    tools {
        nodejs 'nodejs' 
    }
    stages {
        stage('Descarga de Código') {
            steps {
                checkout scm
            }
        }

        stage('Análisis de Backend') {
            steps {
                dir("Proyecto-CARBID/PROYECTO CARBID/backend") {
                    withSonarQubeEnv('sonarqube') {
                        bat 'npx sonar-scanner -Dsonar.projectKey=PROYECTO-CARBID -Dsonar.sources=. -Dsonar.javascript.file.suffixes=.js'
                    }
                }
            }
        }

        stage('Resultado del Análisis') {
            steps {
                // Como el firewall bloquea el retorno, dejamos un aviso manual
                echo "Análisis enviado con éxito a SonarQube."
                echo "Revisar resultados en: http://localhost:9000/dashboard?id=PROYECTO-CARBID"
            }
        }
    }
}









