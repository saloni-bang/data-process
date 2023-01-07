const delayProm = async (delayInMs) => {
    await new Promise((resolve) => setTimeout(() => resolve(), delayInMs))
}

module.exports = {
    delayProm
}