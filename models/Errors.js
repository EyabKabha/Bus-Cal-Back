
function BuscalError (msg) {
    this.name = "BuscalError";
    this.message = (msg || "");
}

module.exports = {
    BuscalError
};