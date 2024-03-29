/* eslint-disable no-console */

import {info, setFailed} from '@unlike/github-actions-core'

import {createCloudflareDeployment} from './cloudflare/deployment/create.js'
import {getCloudflareProject} from './cloudflare/project/get.js'
import {deleteDeployments} from './delete.js'
import {addComment} from './github/comment.js'
import {useContext, useContextEvent} from './github/context.js'
import {createGitHubDeployment} from './github/deployment/create.js'

export async function run() {
  const {branch} = useContext()
  const {eventName, payload} = useContextEvent()

  /**
   * Only support eventName push & pull_request.
   */
  if (eventName !== 'push' && eventName !== 'pull_request') {
    setFailed(`GitHub Action event name '${eventName}' not supported.`)
    return
  }

  /**
   * Validate Cloudflare project
   */
  const project = await getCloudflareProject()

  if (eventName === 'pull_request' && payload.action === 'closed') {
    await deleteDeployments()
    return
  }

  const isProduction = project.production_branch === branch
  if (eventName === 'push' && isProduction) {
    try {
      info('Is production branch, deleting old deployments but latest 5')
      await deleteDeployments(isProduction)
    } catch {
      /**
       * We don't want to fail the deployment if we can't delete old production deployments.
       */
      info('Error deleting deployments for production branch')
    }
  }

  const {deployment: cloudflareDeployment, wranglerOutput} =
    await createCloudflareDeployment()
  const commentId = await addComment(cloudflareDeployment, wranglerOutput)
  await createGitHubDeployment(cloudflareDeployment, commentId)
}
