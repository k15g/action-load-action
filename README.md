# Action: Load action

```yaml
- name: Load action
  uses: k15g/action-load-action@edge
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    action: k15g/action-load-env@v1

- name: Load environment variables
  uses: ./.github/actions/k15g/action-load-env
```


## Inputs


### `token` (optional)


### `action`

```yaml
- name: Load action
  uses: k15g/action-load-action@edge
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    action: |
      k15g/action-load-env@v1
      k15g/action-github-release-info@v1
```
