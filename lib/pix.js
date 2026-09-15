const CRC_TABLE = (() => {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i << 8;
    for (let j = 0; j < 8; j++) {
      c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
    }
    table[i] = c;
  }
  return table;
})();

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >> 8) ^ payload.charCodeAt(i)) & 0xff]) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const emv = (id, value) => `${id}${String(value.length).padStart(2, "0")}${value}`;

export function gerarPixCopiaECola({ key, amount, name, city, txid = "***" }) {
  const merchantAccount =
    emv("26", emv("00", "BR.GOV.BCB.PIX") + emv("01", key));
  const payload =
    "000201" +
    merchantAccount +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", amount.toFixed(2)) +
    emv("58", "BR") +
    emv("59", name) +
    emv("60", city) +
    emv("62", emv("05", txid)) +
    "6304";
  return payload + crc16(payload);
}