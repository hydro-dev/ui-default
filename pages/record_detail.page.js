import { NamedPage } from 'vj/misc/Page';

const page = new NamedPage('record_detail', async () => {
  const { default: SockJs } = await import('../components/socket');
  const { DiffDOM } = await import('diff-dom');

  const sock = new SockJs(Context.socketUrl);
  const dd = new DiffDOM();
  sock.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    const newStatus = $(msg.status_html);
    const oldStatus = $('#status');
    dd.apply(oldStatus[0], dd.diff(oldStatus[0], newStatus[0]));
    const newSummary = $(msg.summary_html);
    const oldSummary = $('#summary');
    dd.apply(oldSummary[0], dd.diff(oldSummary[0], newSummary[0]));
  };
});

export default page;
