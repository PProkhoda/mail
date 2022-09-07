document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Listen for submission of form
  document.querySelector('#compose-form').onsubmit = send_email;

  // // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-show').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-show').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Load e-mails
  fetch(`/emails/${mailbox}`)

  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with email ...
      emails.forEach(email => view_mail(email, mailbox));
      localStorage.clear();
  });
}


function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);      
  });
  localStorage.clear();
  load_mailbox('sent');
  window.location.reload();
  return false;
}


function view_mail(email, mailbox) {
  
  const mail_td = document.createElement('tr');
  mail_td.className = "table align-items-center"
  mail_td.id = 'mail';

  const recipient = document.createElement('th');
  recipient.id = "email-recipient";
  recipient.scope = "row"
  if (email.read !== false) {
    recipient.className = "col-2 col-sm-2 table-dark table-striped";
  }
  else {
    recipient.className = "col-2 col-sm-2 table-light table-striped";
  }
  // console.log(`Mailbox atual: ${mailbox}`);
  if (mailbox === "inbox") {
    recipient.innerHTML = email.sender;
  } else {
    recipient.innerHTML = email.recipients[0];
  }
  mail_td.append(recipient);

  const subject = document.createElement('td');
  subject.id = "email-subject";
  subject.scope = "row"
  subject.innerHTML = email.subject;
  if (email.read !== false) {
    subject.className = "col-5 col-sm-5 table-dark table-striped";
  }
  else {
    subject.className = "col-5 col-sm-5 table-light table-striped";
  }
  mail_td.append(subject);

  const timestamp = document.createElement('td');
  timestamp.id = "email-timestamp";
  timestamp.scope = "row"
  if (email.read !== false) {
    timestamp.className = "col-3 col-sm-3 table-dark table-striped";
  }
  else {
    timestamp.className = "col-3 col-sm-3 table-light table-striped";
  }
  timestamp.innerHTML = email.timestamp;
  mail_td.append(timestamp);

  if (mailbox !== "sent") {
    const arch_td = document.createElement('td');
    const mail_archive = document.createElement('button');
    if (email.read !== false) {
      mail_archive.className = "btn btn-dark ";
    }
    else {
      mail_archive.className = "btn btn-light";
    }
    mail_archive.id = "email-mail_archive";
    // mail_archive.value = email.id;
    if (email.archived === true) {
      mail_archive.innerHTML = "Unarchive";
      arch_td.appendChild(mail_archive);
      mail_td.append(arch_td);
    }
    else {
      mail_archive.innerHTML = "Archive";
      arch_td.appendChild(mail_archive);
      mail_td.append(arch_td);
    }
    mail_archive.addEventListener('click', () => archive_email(email) );
  }
  recipient.addEventListener('click', () => show_mail(email.id) );
  subject.addEventListener('click', () => show_mail(email.id) );
  timestamp.addEventListener('click', () => show_mail(email.id) );
  document.querySelector('#emails-view').append(mail_td);
  // document.querySelector('#mail-table').append(mail_td);
}


function show_mail(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-show').style.display = 'block';

  localStorage.clear();

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      document.querySelector('#email-show').innerHTML = "";

      const mail_div = document.createElement('div');
      mail_div.className = "container";
      mail_div.id = 'mail_div';

      const mail_sender = document.createElement('div');
      mail_sender.id = "email-mail_sender";
      mail_sender.className = "col";
      mail_sender.innerHTML = `<b>From: </b>${email.sender}`;
      mail_div.append(mail_sender);

      const mail_recipients = document.createElement('div');
      mail_recipients.id = "email-mail_recipients";
      mail_recipients.className = "col";
      mail_recipients.innerHTML = `<b>To: </b>${email.recipients}`;
      mail_div.append(mail_recipients);

      const mail_subject = document.createElement('div');
      mail_subject.id = "email-mail_subject";
      mail_subject.className = "col";
      mail_subject.innerHTML = `<b>Subject: </b>${email.subject}`;
      mail_div.append(mail_subject);

      const mail_timestamp = document.createElement('div');
      mail_timestamp.id = "email-mail_timestamp";
      mail_timestamp.className = "col";
      mail_timestamp.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
      mail_div.append(mail_timestamp);

      const mail_reply = document.createElement('button');
      mail_reply.className = "col";
      mail_reply.id = "email-mail_reply";
      mail_reply.value = email;
      mail_reply.innerHTML = "Reply";
      mail_div.append(mail_reply);

      const mail_body = document.createElement('textarea');
      mail_body.className = "col";
      mail_body.id = "email-mail_body";
      mail_body.innerHTML = email.body;
      mail_div.append(mail_body);

      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      mail_reply.addEventListener('click', () => reply_email(email) );
      document.querySelector('#email-show').append(mail_div);
  });
  return false; 
}


function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-show').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: `;
}

function archive_email (email) {
  if (email.archived === true) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  load_mailbox('inbox');
  window.location.reload();
}


function read_email (email) {
  if (email.archived === true) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: false
      })
    })
  }
  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }
  load_mailbox('inbox');
  window.location.reload();
}