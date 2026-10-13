// The fixed resource import catalogue is generated from the public package entries and their native titles.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeResourceCatalogue(root) {
  const pkg=JSON.parse(readFileSync(join(root,"package.json"),"utf8"));
  const config=JSON.parse(readFileSync(join(root,"docs/site.json"),"utf8"));
  for(const lang of ["en","ja"]){
    const title=lang==="en"?"Map and feature resource catalogue":"地図と地物のデータ一覧";
    const description=lang==="en"?"Every fixed map and feature import, generated from the existing public resource paths.":"既存の公開パスから作る、地図と地物の固定 import の一覧です。";
    const heading=lang==="en"?"Fixed resources":"固定のデータ";
    const explanation=lang==="en"?"These entries name the same files as the country, subdivision and feature wildcards. Choose a resource on the canvas used by your drawing. Dynamic selection uses the loaders; unsupported codes return null. The data’s identifiers, geometry and order are unchanged.":"この一覧は、国・行政区画・地物のワイルドカードと同じファイルを指します。表示に使うキャンバスに対応するデータを選んでください。動的に選ぶ場合は読み込みの関数を使い、未対応のコードは null になります。データの ID、形、順序は変えていません。";
    const lines=["---",`title: ${title}`,"section: explanation","order: 12",`description: ${description}`,"---","",`## ${heading}`,"",explanation,"",lang==="en"?"| Import | Resource |":"| Import | データ |","| --- | --- |"];
    for(const key of Object.keys(pkg.exports).filter(key=>/^\.\/(countries|divisions|features)\//.test(key)&&!key.includes("*"))){
      const slug=key.slice(2).replaceAll("/","-");
      lines.push(`| \`${pkg.name}/${key.slice(2)}\` | [${config.entries[key][lang].replaceAll("|","\\|")}](entry:${slug}) |`);
    }
    lines.push("",lang==="en"?"See [loading maps](loading-maps.md) and [the preserved map-data reference](../map-data.md).":"[地図の読み込み](loading-maps.md)と[地図データのリファレンス](../../map-data.md)も参照してください。","");
    writeFileSync(join(root,"docs/guides",lang==="ja"?"ja":"","map-resources.md"),lines.join("\n"));
  }
}
