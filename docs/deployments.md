# Deployments

This section provides the basic steps for deploying reveal web.

## Tag a release

Semantic versioning ([here](https://semver.org/) is a quick read) is used when drafting releases.

There are two methods supported for deploying this app:

## 1. Using kubernetes

The is the most automated method which doesn't require running any scripts. All is needed is to update values of the instance to deployed on the [infrustructure repo](https://github.com/onaio/infrastructure) and merge the changes ro master. [Here](https://github.com/onaio/infrastructure/blob/master/helm/releases/mango.dev.k8s.onalabs.org/opensrp/reveal-web-stage/values.yaml) is an example of stage instance.

## 2. Using ansible

Ansible requires running of playbook scripts. Since on production express js is used to serve the react build, it is possible to run the express app or the react app deployments independently.

### _procedure_

i. Set up OpenSRP playbooks and instal dependencies. See docs [here](https://github.com/opensrp/playbooks/blob/master/README.md)

ii. Update inventories of the instance to deploy

iii. Run ansible playbook scripts
`ansible-playbook reveal-web.yml -i <path to inventory> --vault-password-file <path to pass file>`
To only deploy either express or react, `--skip-tags=express` or `--skip-tags=react` flags can be used.
