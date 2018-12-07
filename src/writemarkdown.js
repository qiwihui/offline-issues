var fs = require('fs')
var path = require('path')

var handlebars = require('handlebars')
var mkdirp = require('mkdirp')

module.exports = function writemarkdown (options, cb) {
  if (options.destination) {
    var dest = path.resolve(options.destination)
  } else {
    var dest = 'md'
  }
  var markdownTemplate = 'markdown'
  if (options.template) {
    markdownTemplate = options.template
  }
  var templateFile = markdownTemplate + ".hbs"

  mkdirp(dest, function (err) {
    if (err) return cb(err, 'Error creating md directory.')
  })

  var issues = fs.readFileSync('comments.json')
  issues = JSON.parse(issues)
  issues.forEach(function (issue) {
    var filename = repoDetails(issue.url)
    var source = fs.readFileSync(path.join(__dirname, '/templates/', templateFile))
    var template = handlebars.compile(source.toString())
    var result = template(issue)

    fs.writeFile(dest + '/' + filename + '.md', result, function (err) {
      if (err) return cb(err, 'Error writing md file.')
    })

  })
  cb(null, 'Wrote markdown files.')
}

function repoDetails (issue) {
  var a = issue.split('/')
  var filename = a[3] + '-' + a[4] + '-' + a[6]
  return filename
}
