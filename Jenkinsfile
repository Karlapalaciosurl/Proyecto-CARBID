def failedStage = ""
def summary = []

pipeline {
    agent any
    triggers { githubPush() }
    tools { nodejs 'nodejs' }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pruebas Backend') {
            steps {
                script {
                    try {
                        dir('PROYECTO CARBID/backend') {
                            bat 'npm install'
                            int code = bat(script: 'npm audit --audit-level=critical', returnStatus: true)
                            if (code != 0) {
                                failedStage = "Backend (npm audit CRITICAL)"
                                error("Backend audit failed")
                            }
                        }
                        summary << "Backend: OK"
                    } catch (e) {
                        summary << "Backend: FAIL"
                        throw e
                    }
                }
            }
        }

        stage('Pruebas de Frontend') {
            steps {
                script {
                    try {
                        dir('PROYECTO CARBID/frontend') {
                            bat 'npm install'
                            int code = bat(script: 'npm audit --audit-level=critical', returnStatus: true)
                            if (code != 0) {
                                failedStage = "Frontend (npm audit CRITICAL)"
                                error("Frontend audit failed")
                            }
                        }
                        summary << "Frontend: OK"
                    } catch (e) {
                        summary << "Frontend: FAIL"
                        throw e
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        withSonarQubeEnv('sonarqube') {
                            bat 'npx sonar-scanner -Dsonar.qualitygate.wait=true'
                        }
                        summary << "SonarQube: OK"
                    } catch (e) {
                        failedStage = failedStage ?: "SonarQube"
                        summary << "SonarQube: FAIL"
                        throw e
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def result = currentBuild.currentResult ?: "SUCCESS"
                def stageInfo = failedStage ? "Falló en: ${failedStage}" : "Sin fallos"
                def details = summary ? summary.join("\\n") : "(Sin detalle)"

                def msg = """Pipeline: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
Resultado: ${result}
${stageInfo}

Detalle:
${details}

URL: ${env.BUILD_URL}
"""

                office365ConnectorSend(
                    webhookUrl: "https://default0f78549d3eec43afb56a6f7b042d6c.9a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4868894c1a1648dca3ca5c60ab120938/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l8mp1VPAEbGhLl6KmMFjgB7-6gZpOfxVzMLveJlznJc",
                    status: result,
                    color: result == 'SUCCESS' ? "00FF00" : "FF0000",
                    message: msg
                )
            }
        }
    }
}



