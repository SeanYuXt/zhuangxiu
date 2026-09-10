import {options} from './child-bay-options-data.js?v=footdesk-0908';

// No fallback: a rejected or stale URL must never resurrect another old layout.
export const resolveScheme = id => options.find(option => option.id === id) ?? null;

if (typeof document !== 'undefined') {
  const requested = new URLSearchParams(location.search).get('scheme');
  if (resolveScheme(requested)) {
    await import('./child-bay-options.js?v=footdesk-0908');
  } else {
    document.title = '儿童房 · 已清理淘汰方案';
    document.querySelector('h1').textContent = '儿童房 · 方案整理';
    document.querySelector('header small').textContent = '已删除明确否定的方案；目前没有已确认设计';
    document.querySelector('nav').hidden = true;
    document.querySelector('.controls').hidden = true;
    document.querySelectorAll('aside:first-child > .hint').forEach(el => el.hidden = true);
    const viewport = document.querySelector('#viewport');
    viewport.replaceChildren();
    const notice = document.createElement('div');
    notice.style.cssText = 'padding:32px;max-width:620px;margin:40px auto;line-height:1.9';
    const title = document.createElement('h2');
    title.textContent = requested ? '该旧方案已删除，不再展示' : '淘汰方案已清理';
    const body = document.createElement('p');
    body.textContent = '90厘米柜、横床入窗位、中间柜遮挡、沿墙排布和1.8米柜试排均已移除。不会自动替换成其他旧方案。';
    const caveat = document.createElement('p');
    caveat.textContent = '新增南床北整墙柜距离试排，保留西柜北桌L形对照及两项飘窗条件研究。新试排的窗前步行路径未解决，均不是施工定稿。cabinetwall及此前否定方案不恢复，原户型及其他房间未改。';
    notice.append(title, body, caveat);viewport.append(notice);
    document.querySelector('aside:first-child h2').textContent = '新试排与条件研究';
    const choices = document.querySelector('#choices');choices.replaceChildren();
    for (const option of options) {
      const button = document.createElement('button');button.className = 'choice';button.textContent = option.name;
      button.onclick = () => {const url = new URL(location.href);url.searchParams.set('scheme', option.id);location.assign(url.href);};
      choices.append(button);
    }
    const side = document.querySelector('aside:last-child');side.replaceChildren();
    const heading = document.createElement('h2');heading.textContent = '没有已确认方案';
    const note = document.createElement('p');note.textContent = '已否定的方案不再用于后续设计。备份留在预览目录之外，可恢复；不占用方案列表。';
    side.append(heading,note);
  }
}
