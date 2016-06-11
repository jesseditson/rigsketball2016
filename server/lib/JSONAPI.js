
module.exports = JSONAPI

function JSONAPI(baseURL) {
  return function toJSONAPI(type, obj) {
    var includeMap = getIncludedData(obj.relationships, baseURL, true)
    baseURL = baseURL || ''
    return {
      links: { self: `${baseURL}/${type}`},
      data: toJSONAPIData(type, obj, baseURL),
      included: Object.keys(includeMap).reduce((a, d) => {
        return a.concat(includeMap[d])
      }, [])
    }
  }
}

function applyTransform(obj, transform) {
  if (Array.isArray(obj)) {
    return obj.map(transform)
  } else {
    return transform(obj)
  }
}

function getIncludedData(relationships, baseURL, deep, transform) {
  if (!relationships) return {}
  return Object.keys(relationships).reduce((o, r) => {
    var data = relationships[r]
    var type
    if (data.type && data.value) {
      type = data.type
      data = data.value
    }
    if (deep) {
      applyTransform(data, d => {
        if (!d.relationships) return
        var nextDepth = getIncludedData(d.relationships, baseURL, transform)
        for (var k in nextDepth) {
          o[k] = nextDepth[k]
        }
      })
    }
    if (transform) data = applyTransform(data, transform)
    o[r] = toJSONAPIData(type || r, data, baseURL)
    return o
  }, {})
}

function toJSONAPIData(type, obj, baseURL) {
  if (typeof type !== 'string') throw new Error('Invalid arguments passed to toJSONAPIData')
  if (Array.isArray(obj)) {
    return obj.map(o => toJSONAPIData(type, o, baseURL))
  } else {
    if (!obj) throw new Error('Invalid object passed to toJSONAPIData')
    var atts = Object.keys(obj).filter(o => !~['id', 'relationships'].indexOf(o))
    var includeMap = getIncludedData(obj.relationships, baseURL, false, i => {
      return { id: i.id }
    })
    var includeKeys = Object.keys(includeMap)
    var resp = {
      type: type,
      id: obj.id
    }
    if (includeKeys.length) {
      resp.relationships = includeKeys.reduce((o, k) => {
        o[k] = {
          links: { self: `${baseURL}/${type}/${obj.id}/relationships/${k}` },
          data: includeMap[k]
        }
        return o
      }, {})
    }
    if (atts.length) {
      resp.attributes = atts.reduce((o, k) => {
        o[k] = obj[k]
        return o
      }, {})
    }
    return resp
  }
}
