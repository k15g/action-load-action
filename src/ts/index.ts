import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as tar from 'tar'

async function run() {

    var octokit = github.getOctokit(core.getInput('token'))
    var action = core.getInput('action', { required: true })

    var regex = /^([\w\-]+)\/([\w\-]+)(@([\w\-]+))?$/

    if (action.match(regex)) {
        var [_, owner, repo, _, ref] = action.match(regex)

        console.log(`${owner}/${repo}@${ref}`)

        var response = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref })
        console.log(response)

        var writable = tar.extract({
            strip: 0,
            C: `.github/actions/${owner}/${repo}`
        });
        
        writable.write(response.data.toString())
        writable.end()
    }
}

run()