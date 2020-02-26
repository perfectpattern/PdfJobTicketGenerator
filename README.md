# JobTicketService
This service generates a print job ticket PDF (in German: 'Laufzettel' or 'Auftragstasche') from a sPrint One GangJobEvent in JSON format posted against this webservice. An example of such a ticket can be seen in the root directory.

The webservice has the following endpoints:

  	"/": POST a gangJobEvent JSON

	"/version": GET to receive version details

The endpoints below are testing endpoints with hardcoded test data:

	"/test/html": GET to receive the html version e.g. with a browser
  
  	"/test/pdf": GET to receive the pdf version e.g. with a browser
