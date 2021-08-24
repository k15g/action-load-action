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

        var response = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref })

        if (!fs.existsSync(`.github/actions`))
            fs.mkdirSync(`.github/actions`)

        fs.writeFileSync(`.github/actions/${owner}-${repo}.tar.gz`, Buffer.from(response.data as ArrayBuffer))

        if (fs.existsSync(`.github/actions/${owner}/${repo}`))
            fs.rmdirSync(`.github/actions/${owner}/${repo}`, { recursive: true })

        fs.mkdirSync(`.github/actions/${owner}/${repo}`, { recursive: true })

        tar.extract({
            file: `.github/actions/${owner}-${repo}.tar.gz`,
            strip: 1,
            C: `.github/actions/${owner}/${repo}`,
            sync: true
        })

        fs.rmSync(`.github/actions/${owner}-${repo}.tar.gz`)
    } else {
        core.setFailed(`Identifier '${action}' is not valid`)
    }
}

run()