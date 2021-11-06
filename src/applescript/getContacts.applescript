set csv to ""

tell application "Contacts"
	repeat with eachPerson in people
		set personName to name of eachPerson
		set profilePicture to image of eachPerson
		repeat with eachNumber in phones of eachPerson
			set theNum to (get value of eachNumber)
			set csv to csv & personName & "," & theNum & "\n"
		end repeat
		repeat with eachEmail in emails of eachPerson
			set theEmail to (get value of eachEmail)
			set csv to csv & personName & "," & theEmail & "\n"
		end repeat
	end repeat
end tell

return csv
