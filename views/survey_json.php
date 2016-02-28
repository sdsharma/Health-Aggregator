<?php
if(isset($_POST['q1']) && isset($_POST['q2']) && isset($_POST['q3']) && isset($_POST['q4']) && isset($_POST['q5']) && isset($_POST['q6']) && isset($_POST['q7'])) {
    // adds form data into an array
    $formdata = array(
      'q1'=> $_POST['q1'],
      'q2'=> $_POST['q2'],
      'q3'=> $_POST['q3'],
      'q4'=> $_POST['q4'],
      'q5'=> $_POST['q5'],
      'q6'=> $_POST['q6'],
      'q7'=> $_POST['q7']
    );

    // encodes the array into a string in JSON format (JSON_PRETTY_PRINT - uses whitespace in json-string, for human readable)
    $jsondata = json_encode($formdata, JSON_PRETTY_PRINT);

    // saves the json string in "formdata.txt" (in "dirdata" folder)
    // outputs error message if data cannot be saved
    if(file_put_contents('./mentalhealth.json', $jsondata)) echo 'Data successfully saved';
    else echo 'Unable to save data in "dirdata/formdata.txt"';
}
else echo 'Form fields not submited';
?>