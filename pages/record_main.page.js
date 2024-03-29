import { NamedPage } from 'vj/misc/Page';
import UserSelectAutoComplete from 'vj/components/autocomplete/UserSelectAutoComplete';

const page = new NamedPage('record_main', async () => {
  const { default: SockJs } = await import('../components/socket');
  const { DiffDOM } = await import('diff-dom');

  const sock = new SockJs(Context.socketUrl);
  const dd = new DiffDOM();

  sock.onopen = () => {
    sock.send(JSON.stringify({ rids: Context.rids }));
  };
  sock.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    const $newTr = $(msg.html);
    const $oldTr = $(`.record_main__table tr[data-rid="${$newTr.attr('data-rid')}"]`);
    if ($oldTr.length) {
      $oldTr.trigger('vjContentRemove');
      dd.apply($oldTr[0], dd.diff($oldTr[0], $newTr[0]));
      $oldTr.trigger('vjContentNew');
    } else {
      $('.record_main__table tbody').prepend($newTr);
      $newTr.trigger('vjContentNew');
    }
  };
  UserSelectAutoComplete.getOrConstruct($('.filter-user [name="uidOrName"]'), {
    clearDefaultValue: false,
  });
});

export default page;
