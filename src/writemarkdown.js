var fs = require('fs')
var path = require('path')

var handlebars = require('handlebars')
var mkdirp = require('mkdirp')

String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
  if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
    return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
  } else {
    return this.replace(reallyDo, replaceWith);
  }
}

module.exports = function writemarkdown(options, cb) {
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
    // TODO：处理特殊字符
    result = result.replaceAll("&#x60;", "`")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&#x3D;", "=")
      .replaceAll("&quot;", "\"")
      .replaceAll("&#x27;", "'")
      .replaceAll("'", "\'")
      .replaceAll("&amp;", "&")

    fs.writeFile(dest + '/' + filename + '.md', result, function (err) {
      if (err) return cb(err, 'Error writing md file.')
    })

  })
  cb(null, 'Wrote markdown files.')
}

function repoDetails(issue) {
  var a = issue.split('/')
  var filename = a[3] + '-' + a[4] + '-' + a[6]
  return filename
}
