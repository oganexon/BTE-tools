/* global importPackage Packages context player Vector */
const getProjection = require('./getProjection')

importPackage(Packages.com.sk89q.worldedit)
importPackage(Packages.com.sk89q.worldedit.math)
importPackage(Packages.com.sk89q.worldedit.blocks)

const blocks = context.remember()
let changedBlocks = 0
const DataError = new Error('Incorrect data format')
const ignoreBlocks = getIgnoredBlocks()
const allowedBlocks = getAllowedBlocks()

module.exports = function (data, block, options) {
  options = options || {}
  draw(parse(data), block, options)
}

function parse (data) {
  if (data.type !== 'FeatureCollection') throw DataError
  if (!Array.isArray(data.features)) throw DataError

  const geometry = []
  let lines = 0
  for (let i = 0; i < data.features.length; i++) {
    if (data.features[i].geometry.type !== 'LineString') continue
    const coordinates = data.features[i].geometry.coordinates
    geometry.push(coordinates)
    lines += coordinates.length
  }

  player.print(`§7${lines} lines to draw`)

  return geometry
}

function draw (geometry, block, options) {
  const y = player.getPosition().y
  block = context.getBlock(block)

  player.print('§7Please wait...')
  const projection = getProjection()

  for (let i = 0; i < geometry.length; i++) {
    const shape = geometry[i]
    for (let j = 0; j < shape.length - 1; j++) {
      const [x1, z1] = projection.fromGeo(...shape[j])
      const [x2, z2] = projection.fromGeo(...shape[j + 1])
      drawLine(x1, y, z1, x2, y, z2, block, options)
    }
  }

  player.print('Operation completed (' + changedBlocks + ' blocks affected).')
}

function drawLine (x1, y1, z1, x2, y2, z2, block, options) {
  const lenX = x2 - x1
  const lenY = y2 - y1
  const lenZ = z2 - z1

  const max = Math.max(Math.abs(lenX), Math.abs(lenY), Math.abs(lenZ))

  const incrX = lenX / max
  const incrY = lenY / max
  const incrZ = lenZ / max

  const incrMax = Math.max(Math.abs(incrX), Math.abs(incrY), Math.abs(incrZ))

  for (var i = 0; i < max; i += incrMax) {
    var pos = new Vector(Math.floor(x1 + incrX * i), Math.floor(y1 + incrY * i), Math.floor(z1 + incrZ * i))

    while (!ignoreBlocks.includes(blocks.getBlock(pos.add(new Vector(0, 1, 0))).id)) {
      pos = pos.add(new Vector(0, 1, 0))
    }
    while (ignoreBlocks.includes(blocks.getBlock(pos).id)) {
      pos = pos.add(new Vector(0, -1, 0))
    }

    if (allowedBlocks.includes(blocks.getBlock(pos).id)) {
      if (options.up) {
        pos = pos.add(new Vector(0, 1, 0))
      }
      blocks.setBlock(pos, block)
      changedBlocks++
    }
  }
}

function getIgnoredBlocks () {
  return [
    context.getBlock('air').id,
    context.getBlock('tallgrass').id,
    context.getBlock('sapling').id,
    context.getBlock('log').id,
    context.getBlock('log2').id,
    context.getBlock('leaves').id,
    context.getBlock('leaves2').id,
    context.getBlock('deadbush').id,
    context.getBlock('red_flower').id,
    context.getBlock('yellow_flower').id,
    context.getBlock('red_mushroom').id,
    context.getBlock('brown_mushroom').id,
    context.getBlock('vine').id,
    context.getBlock('waterlily').id,
    context.getBlock('cactus').id,
    context.getBlock('reeds').id,
    context.getBlock('pumpkin').id,
    context.getBlock('melon_block').id,
    context.getBlock('snow_layer').id,
    context.getBlock('double_plant').id
  ]
}

function getAllowedBlocks () {
  return [
    context.getBlock('grass').id,
    context.getBlock('dirt').id,
    context.getBlock('stone').id,
    context.getBlock('sand').id,
    context.getBlock('grass_path').id,
    context.getBlock('concrete').id,
    context.getBlock('gravel').id,
    context.getBlock('water').id,
    context.getBlock('lava').id
  ]
}