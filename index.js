"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const tar = require("tar");
async function run() {
    var octokit = github.getOctokit(core.getInput('token'));
    var actions = core.getInput('action', { required: true });
    var regex = /^([\w\-]+)\/([\w\-]+)(@([\w\-]+))?$/;
    if (!fs.existsSync(`.github/actions`))
        fs.mkdirSync(`.github/actions`, { recursive: true });
    actions.split("\n").forEach(async (action) => {
        if (action.match(regex)) {
            var [_, owner, repo, _, ref] = action.match(regex);
            var response = await octokit.rest.repos.downloadTarballArchive({ owner, repo, ref });
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
            fs.unlinkSync(`.github/actions/${owner}-${repo}.tar.gz`);
            fs.writeFileSync(`.github/actions/${owner}/${repo}/.gitignore`, '*');
        }
        else {
            core.error(`Identifier '${action}' is not valid`);
        }
    });
}
run();
