"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const tar = require("tar");
async function run() {
    var octokit = github.getOctokit(core.getInput('token'));
    var action = core.getInput('action', { required: true });
    var regex = /^([\w\-]+)\/([\w\-]+)(@([\w\-]+))?$/;
    if (action.match(regex)) {
        var [_, owner, repo, _, ref] = action.match(regex);
        var response = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref });
        if (!fs.existsSync(`.github/actions`))
            fs.mkdirSync(`.github/actions`);
        fs.writeFileSync(`.github/actions/${owner}-${repo}.tar.gz`, Buffer.from(response.data));
        if (fs.existsSync(`.github/actions/${owner}/${repo}`))
            fs.rmdirSync(`.github/actions/${owner}/${repo}`, { recursive: true });
        fs.mkdirSync(`.github/actions/${owner}/${repo}`, { recursive: true });
        tar.extract({
            file: `.github/actions/${owner}-${repo}.tar.gz`,
            strip: 1,
            C: `.github/actions/${owner}/${repo}`,
            sync: true
        });
        fs.rmSync(`.github/actions/${owner}-${repo}.tar.gz`);
    }
    else {
        core.setFailed(`Identifier '${action}' is not valid`);
    }
}
run();
