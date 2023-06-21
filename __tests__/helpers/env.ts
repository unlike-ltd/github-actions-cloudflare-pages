export const TEST_ENV_VARS: NodeJS.ProcessEnv = {
  GITHUB_REF_NAME: 'mock-github-ref-name',
  GITHUB_SHA: 'mock-github-sha',
  GITHUB_EVENT_NAME: 'mock-github-event-name'
}

export const setTestEnvVars = () => {
  for (const key in TEST_ENV_VARS) {
    if (Object.prototype.hasOwnProperty.call(TEST_ENV_VARS, key)) {
      process.env[key] = TEST_ENV_VARS[key]
    }
  }
}
