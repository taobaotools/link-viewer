const CONFIRM = 'WARNING! Are you sure you want to open these links? Since there are {} links, you ' +
    'may experience some lag in your web browser';

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
        error: function (jqXHR, exception) {
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

    // Add EventListener for opening links
    document.getElementById('valid-open').addEventListener('click', function () {
        var linkCount = isDict ? Object.keys(validLinks).length : validLinks.length;
        if (linkCount >= 10 && !confirm(CONFIRM.replace('{}', linkCount))) {
            return;
        }

        if (isDict) {
            Object.keys(validLinks).forEach(function (key) {
                window.open(validLinks[key]);
            });
        } else {
            validLinks.forEach(function (link) {
                window.open(link);
            });
        }
    });

    // Set the components
    setComponents(validLinks, isDict);
}

/* Prepare components to show valid and invalid links */
function setComponents(validLinks, isDict) {
    // Build HTML
    var html = '';
    var raw = '';
    var combined = '';
    var length = 0;

    if (isDict) {
        Object.keys(validLinks).forEach(function (key) {
            html += buildLink(key, validLinks[key]);
            raw += buildLink(validLinks[key], validLinks[key]);
            combined += buildLink(key + ': ' + validLinks[key], validLinks[key]);
            length++;
        });
    } else {
        validLinks.forEach(function (link) {
            html += buildLink(link, link);
            length++;
        });
    }

    // Set component visibility and inner HTML
    setDisplay('loading', false);
    setHTML('valid-content', html);
    setHTML('valid-hidden', html);
    setDisplay('valid', true);
    setHTML('links-title', 'Links (' + length + ')');

    // Add event listeners for checkboxes
    if (isDict && html !== raw) {
        document.getElementById('raw').style.display = 'inline-block';
        document.getElementById('toggle-raw').addEventListener('change', function () {
            console.log('Handling raw toggle event');
            if (this.checked) {
                // Has been checked
                document.getElementById('toggle-combined').checked = false;
                setHTML('valid-content', raw);
                setHTML('valid-hidden', raw);
            } else {
                // Has been unchecked
                setHTML('valid-content', html);
                setHTML('valid-hidden', html);
            }
        });
    }

    if (isDict && html !== combined) {
        document.getElementById('combined').style.display = 'inline-block';
        document.getElementById('toggle-combined').addEventListener('change', function () {
            console.log('Handling combined toggle event');
            if (this.checked) {
                // Has been checked
                document.getElementById('toggle-raw').checked = false;
                setHTML('valid-content', combined);
                setHTML('valid-hidden', combined);
            } else {
                // Has been unchecked
                setHTML('valid-content', html);
                setHTML('valid-hidden', html);
            }
        });
    }
}

// Trigger when window is loaded
window.onload = function () {
    load();
    // Smooth Scrolling to the bottom of the page
    $('#bottom-link').click(function () {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 600);

        if ($('#bottom-link').attr('href') === '#bottom') {
            $('#bottom-link').attr('href', '#top');
            $('#bottom-link').text('↑');
        } else {
            $('#bottom-link').attr('href', '#bottom');
            $('#bottom-link').text('↓');
        }
        return false;
    });
};
