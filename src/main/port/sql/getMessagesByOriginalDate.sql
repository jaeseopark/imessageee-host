select
    cmj.message_id,
    chat_identifier,
    text,
    service,
    cast(
        (date / 1000000000) + strftime('%s', '2001-01-01') as integer
    ) * 1000 as message_date,
    is_from_me,
    attachment_id,
    mime_type,
    total_bytes
from
    message m
    inner join chat_message_join cmj on cmj.message_id = m.ROWID
    inner join chat c on c.ROWID = cmj.chat_id
    LEFT join message_attachment_join maj on maj.message_id = m.ROWID
    LEFT join attachment a on maj.attachment_id = a.ROWID
where
    cmj.message_id > ?
order by
    message_date DESC
limit
    ?
