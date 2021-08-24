import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as tar from 'tar'

async function run() {
    // Fetch inputs
    var octokit = github.getOctokit(core.getInput('token'))
    var actions = core.getInput('action', { required: true })

    // Regex used to match action identifiers
    var regex = /^([\w\-]+)\/([\w\-]+)(@([\w\-]+))?$/

    // Make sure the actions folder exists
    fs.mkdirSync(`.github/actions`, { recursive: true })

    actions.split("\n").forEach(async action => {
        if (action.match(regex)) {
            // Extract values from action identifier
            var [_, owner, repo, _, ref] = action.match(regex)

            // Fetch action tar file
            try {
                var response = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref })
            } catch (e) {
                core.setFailed(`Unable to fetch '${action}': ${e.message}`)
                return
            }

            // Temporary save tar file to disk
            fs.writeFileSync(`.github/actions/${owner}-${repo}.tar.gz`, Buffer.from(response.data as ArrayBuffer))

            // Remove existing version of action if available
            fs.rmdirSync(`.github/actions/${owner}/${repo}`, { recursive: true })
            // fs.rmSync(`.github/actions/${owner}/${repo}`, { recursive: true })

            // Create folder to extract action into
            fs.mkdirSync(`.github/actions/${owner}/${repo}`, { recursive: true })

            // Extract action
            tar.extract({
                file: `.github/actions/${owner}-${repo}.tar.gz`,
                strip: 1,
                C: `.github/actions/${owner}/${repo}`,
                sync: true
            })

            // Remove temporary file
            fs.unlinkSync(`.github/actions/${owner}-${repo}.tar.gz`)
            // fs.rmSync(`.github/actions/${owner}-${repo}.tar.gz`)

            // Override .gitignore in downloaded action to "hide" the action in case of commits
            fs.writeFileSync(`.github/actions/${owner}/${repo}/.gitignore`, '*')
        } else {
            core.setFailed(`Identifier '${action}' is invalid`)
        }
    })
}

run()