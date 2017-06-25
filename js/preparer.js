const CONFIRM = 'WARNING! Are you sure you want to open these links? Since there are {} links, you ' +
    'may temporarily experience some lag in your web browser';

/**
 * Do everything
 */
function load() {
    // Read the query string
    var url = getParameterByName('url');
    console.log('Parsed URL: ' + url);
    if (url === null) {
        setError('No URL specified.');
        return;
    }

    // Check and calculate the hash value to prevent users from requesting URLs themselves
    var hash = getParameterByName('hash');
    console.log('Parsed hash: ' + hash);
    var id = url.split('/')[0];
    var calculatedHash = 0;
    for (var i = 0; i < id.length; i++)
        calculatedHash += parseInt(id.charAt(i), 16);
    console.log('Calculated hash: ' + calculatedHash);
    if (parseInt(hash) !== calculatedHash) {
        setError('Incorrect hash value.');
        return;
    }

    // Add the gist forward URL
    url = 'https://gist.githubusercontent.com/anonymous/' + url;
    console.log('Getting: ' + url);

    // Get the valid links and read into a JSON variable
    $.ajax({
        dataType: 'json',
        url: url,
        data: '',
        success: function (result) {
            display(result);
        },
        error: function(jqXHR, exception) {
            // Get error message and set it
            var message = getErrorMessage(jqXHR, exception);
            setError(message);
        }
    })
}

/**
 * Display everything
 */
function display(validLinks) {
    if (validLinks.length === 0) {
        setError('No links were found.');
        return;
    }

    // Check the type of the parsed JSON and call setComponents accordingly
    var isDict = Object.prototype.toString.call(validLinks) !== '[object Array]';
    console.log('Parsed JSON is a ' + (isDict ? 'dictionary' : 'list'));
    setComponents(validLinks, isDict);

    // Add EventListener for opening links
    document.getElementById('valid-open').addEventListener('click', function () {
        if (validLinks.length <= 10 || validLinks.length > 10 && confirm(CONFIRM.replace('{}', validLinks.length))) {
            if (isDict) {
                Object.keys(validLinks).forEach(function (key) {
                    window.open(validLinks[key]);
                });
            } else {
                validLinks.forEach(function (link) {
                    window.open(link);
                });
            }
        }
    });
}

/* Prepare components to show valid and invalid links */
function setComponents(validLinks, isDict) {
    // Build HTML
    var html = '';
    if (isDict) {
        Object.keys(validLinks).forEach(function (key) {
            html += buildLink(key, validLinks[key]);
        });
    } else {
        validLinks.forEach(function (link) {
            html += buildLink(link, link);
        });
    }

    // Set component visibility and inner HTML
    setDisplay('loading', false);
    setHTML('valid-content', html);
    setHTML('valid-hidden', html);
    setDisplay('valid', true);
}

// Trigger when window is loaded
window.onload = load();
