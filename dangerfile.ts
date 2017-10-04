const { danger, fail } = require('danger')

const someoneAssigned = danger.github.pr.assignee
if (someoneAssigned === null) {
  fail("Please assign someone to merge this PR, and optionally include people who should review.")
}
if (danger.github.pr.body.length === 0) {
  fail("Please describe your PR.")
}
