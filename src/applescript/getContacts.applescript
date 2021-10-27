set csv to ""

tell application "Contacts"
	repeat with eachPerson in people
		set personName to name of eachPerson
		repeat with eachNumber in phones of eachPerson
			set theNum to (get value of eachNumber)
			set csv to csv & personName & "," & theNum & "\n"
		end repeat
	end repeat
end tell

return csv
