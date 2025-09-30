import React, { useState } from "react";

const OltCliGenerator = () => {
  const [slot, setSlot] = useState("");
  const [pon, setPon] = useState("");
  const [onu, setOnu] = useState("");
  const [sn, setSn] = useState("");
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [odp, setOdp] = useState(""); // Input ODP
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enableNat, setEnableNat] = useState(false); // Checkbox NAT
  const [output, setOutput] = useState("");
  const [showPushButton, setShowPushButton] = useState(false);

  const generateCliScript = () => {
    const vlan = pon < 10 ? `1${slot}0${pon}` : `1${slot}${pon}`;
    const s1px = `S${slot}-P${pon}`;
    const onuId = `${onu}`;
    const middle = slot === 1 ? 1 : slot;

    let script = `
conf t
interface gpon-olt_1/${middle}/${pon}
onu ${onuId} type ZXHN-F609 sn ${sn}
exit
interface gpon-onu_1/${middle}/${pon}:${onuId}
name ${namaPelanggan}
description ${odp}
tcont 1 profile HOME-PPPOE
gemport 1 tcont 1
gemport 1 traffic-limit downstream HOME-PPPOE
service-port 1 vport 1 user-vlan ${vlan} vlan ${vlan}
exit
pon-onu-mng gpon-onu_1/${middle}/${pon}:${onuId}
service ${s1px} gemport 1 vlan ${vlan}
wan-ip 1 mode pppoe username ${username} password ${password} vlan-profile ${s1px} host 1
security-mgmt 212 state enable mode forward protocol web https
interface eth eth_0/1 state lock
interface eth eth_0/2 state lock
interface eth eth_0/3 state lock
interface eth eth_0/4 state lock
`;

    // Tambahkan command NAT jika checkbox dicentang
    if (enableNat) {
      script += `wan 1 service internet host 1\n`;
    }

    setOutput(script);
    setShowPushButton(false);
  };

  const resetForm = () => {
    setSlot("");
    setPon("");
    setOnu("");
    setSn("");
    setNamaPelanggan("");
    setOdp("");
    setUsername("");
    setPassword("");
    setEnableNat(false);
    setOutput("");
    setShowPushButton(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
      .then(() => {
        alert("Script berhasil disalin dan dimasukkan ke OLT!");
        setShowPushButton(true);
      })
      .catch(() => alert("Gagal menyalin ke clipboard."));
  };

  // Tombol Push dibuat tidak berfungsi
  const pushToOLT = () => {
    // Dikosongkan agar tidak melakukan apa-apa
    // console.log("Push to OLT dinonaktifkan");
  };

  return (
    <div style={{ textAlign: "center", color: "white", background: "#2c2c2c", padding: "20px" }}>
      <h1>OLT CLI Generator</h1>

      {/* Slot Input + Tombol */}
      <div>
        <label>Slot:</label>
        <input type="text" value={slot} onChange={(e) => setSlot(e.target.value)} />
        <div style={{ marginTop: "5px" }}>
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s.toString())}
              style={{ margin: "2px", padding: "5px 10px" }}
            >
              S{s}
            </button>
          ))}
        </div>
      </div>

      {/* PON Input + Tombol */}
      <div>
        <label>PON:</label>
        <input type="text" value={pon} onChange={(e) => setPon(e.target.value)} />
        <div style={{ marginTop: "5px", display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
          {[...Array(16).keys()].map((i) => (
            <button
              key={i + 1}
              onClick={() => setPon((i + 1).toString())}
              style={{ width: "40px", padding: "5px" }}
            >
              P{i + 1}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label>ONU:</label>
        <input type="text" value={onu} onChange={(e) => setOnu(e.target.value)} />
      </div>
      <div>
        <label>Serial Number (SN):</label>
        <input type="text" value={sn} onChange={(e) => setSn(e.target.value)} />
      </div>
      <div>
        <label>Nama Pelanggan:</label>
        <input type="text" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} />
      </div>
      <div>
        <label>Deskripsi / ODP:</label>
        <input type="text" value={odp} onChange={(e) => setOdp(e.target.value)} />
      </div>
      <div>
        <label>Username PPPoE:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password PPPoE:</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {/* Checkbox Enable NAT */}
      <div style={{ marginTop: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={enableNat}
            onChange={(e) => setEnableNat(e.target.checked)}
          />
          Enable NAT
        </label>
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={generateCliScript}>Submit</button>
        <button onClick={resetForm} style={{ marginLeft: "10px", backgroundColor: "#e74c3c", color: "white" }}>
          Reset
        </button>
      </div>

      {output && (
        <div>
          <h2>Generated CLI Script</h2>
          <p className="note-text">
            <small><i>Mohon perhatikan command "conf t" dan onu ke berapa di OLT</i></small>
          </p>


          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows="15"
            cols="80"
            style={{ resize: "vertical" }}
          />
          <br />
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <button onClick={copyToClipboard}>Copy</button>
          </div>
        </div>
      )}

      {showPushButton && (
        <button
          onClick={pushToOLT} // Tidak melakukan apa-apa
          style={{ marginTop: "10px", backgroundColor: "#4CAF50", color: "white", padding: "10px" }}
        >
          Push to OLT (Setelah Copy)
        </button>
      )}
    </div>
  );
};

export default OltCliGenerator;
